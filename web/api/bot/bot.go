package bot

import (
	"errors"
	"fmt"
	"github.com/PatricioNapoli/olympus/web/api/security"
	"github.com/PatricioNapoli/olympus/web/api/services"
	"github.com/PatricioNapoli/olympus/web/api/utils"
	r "gopkg.in/rethinkdb/rethinkdb-go.v6"
	"math"
	"strconv"
)

type Portfolio struct {
	Coin 		string 	`json:"coin"`
	Free 		string 	`json:"free"`
	FreeFloat	float32
}

type Prediction struct {
	Id  		string 	`json:"id"`
	Value		float32 `json:"value"`
}

type Trade struct {
	ID     		string  `json:"id,omitempty"`
	BinanceID   string  `json:"binance_id"`
	BotID       string  `json:"bot_id"`
	UserID      int     `json:"user_id"`
	Time        int64  	`json:"time"`
	Amount 		float32 `json:"amount"`
	Action 		string  `json:"signal"`
}

func GetPortfolio(key string, secret string, services *services.Services) map[string]Portfolio {
	ts := utils.Millis()
	params := fmt.Sprintf("timestamp=%d", ts)
	hmac := security.NewHMAC(params, secret)

	resp := services.NewRequest("GET",
		fmt.Sprintf("https://api.binance.com/sapi/v1/capital/config/getall?%s&signature=%s", params, hmac),
		map[string]string{"X-MBX-APIKEY": key},
		"")

	var coins []Portfolio
	p := make(map[string]Portfolio)
	utils.FromJSON(resp, &coins)

	var btc Portfolio
	var usdt Portfolio
	for _, c := range coins  {
		if c.Coin == "BTC" {
			btc = c
			f, _ := strconv.ParseFloat(btc.Free, 32)
			btc.FreeFloat = float32(f)
		}
		if c.Coin == "USDT" {
			usdt = c
			f, _ := strconv.ParseFloat(usdt.Free, 32)
			usdt.FreeFloat = float32(f)
		}
	}

	p["btc"] = btc
	p["usdt"] = usdt

	return p
}

func Update(config *Config, key string, secret string, services *services.Services) ([]byte, error) {
	p := GetPortfolio(key, secret, services)

	pred, err := NextHourPred(services)
	if err != nil {
		return nil, err
	}

	priceRes := make(map[string]interface{})
	resp := services.NewRequest("GET", "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", map[string]string{}, "")
	utils.FromJSON(resp, &priceRes)

	price, _ := strconv.ParseFloat(priceRes["askPrice"].(string), 32)
	side := "SELL"

	if pred.Value > float32(price) {
		side = "BUY"
	}

	totalPortfolioBtc := p["btc"].FreeFloat + p["usdt"].FreeFloat / float32(price)

	quantity := float32(0.0)
	if side == "BUY" {
		quantity = float32(math.Min(float64(totalPortfolioBtc * config.PortfolioRatio), float64(p["usdt"].FreeFloat / float32(price))))
	} else {
		quantity = float32(math.Min(float64(totalPortfolioBtc * config.PortfolioRatio), float64(p["btc"].FreeFloat)))
	}

	_, err = r.Table("trades").Insert(Trade{
		BinanceID: "",
		BotID:     config.ID,
		UserID:    1,
		Time:      utils.Millis(),
		Amount:    quantity,
		Action:    side,
	}).Run(services.DB)

	if quantity < 0.00063 {
		return []byte("quantity does not meet minimum BTC order"), errors.New("quantity does not meet minimum BTC order")
	}

	ts := utils.Millis()
	params := fmt.Sprintf("timestamp=%d&symbol=BTCUSDT&side=%s&type=MARKET&quantity=%f", ts, side, quantity)
	hmac := security.NewHMAC(params, secret)

	resp = services.NewRequest("POST",
		"https://api.binance.com/api/v3/order/test",
		map[string]string{"X-MBX-APIKEY": key},
		fmt.Sprintf("%s&signature=%s", params, hmac))

	if resp != nil {
		//r.Table("trades").Insert(Trade{
		//	BinanceID: "",
		//	BotID:     config.ID,
		//	Time:      utils.Millis(),
		//	Amount:    quantity,
		//	Action:    side,
		//})
	}

	return nil, errors.New("binance error: " + string(resp))
}

func NextHourPred(services *services.Services) (Prediction, error) {
	c, err := r.Table("btc_hourly_preds").Max().Run(services.DB)
	if err != nil {
		return Prediction{}, err
	}
	defer c.Close()

	var pred Prediction
	c.One(&pred)

	return pred, nil
}

func NextDayPred(services *services.Services) (Prediction, error) {
	c, err := r.Table("btc_daily_preds").Max().Run(services.DB)
	if err != nil {
		return Prediction{}, err
	}
	defer c.Close()

	var pred Prediction
	c.One(&pred)

	return pred, nil
}