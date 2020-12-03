package server

import (
	"github.com/PatricioNapoli/olympus/web/api/bot"
	"github.com/PatricioNapoli/olympus/web/api/services"
	"github.com/PatricioNapoli/olympus/web/api/utils"
	"github.com/valyala/fasthttp"
	"github.com/valyala/fasthttprouter"
	r "gopkg.in/rethinkdb/rethinkdb-go.v6"
	"log"
)

type Model struct {
	MonthlyRoI  string `json:"monthly_roi"`
	RMSE		string `json:"rmse"`
	Samples		string `json:"train_samples"`
}

func handleErr(ctx *fasthttp.RequestCtx, err error) bool {
	if err != nil {
		log.Print(err.Error())
		ctx.SetStatusCode(500)
		return true
	}
	return false
}

func Empty(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {

}

func GetModelDataHour(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	c, err := r.Table("btc_history_latest").Get("model").Run(services.DB)

	if handleErr(ctx, err) {
		return
	}
	defer c.Close()

	var row Model
	c.One(&row)

	utils.JSON(ctx, row)
}

func GetModelDataDay(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	c, err := r.Table("btc_history_daily_latest").Get("model").Run(services.DB)

	if handleErr(ctx, err) {
		return
	}
	defer c.Close()

	var model Model
	c.One(&model)

	utils.JSON(ctx, model)
}

func GetNextHourPred(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	pred, err := bot.NextHourPred(services)

	if handleErr(ctx, err) {
		return
	}

	utils.JSON(ctx, pred)
}

func GetNextDayPred(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	pred, err := bot.NextDayPred(services)

	if handleErr(ctx, err) {
		return
	}

	utils.JSON(ctx, pred)
}

func GetPortfolio(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	c, err := r.Table("users").Get(1).Run(services.DB)
	if handleErr(ctx, err) {
		return
	}
	defer c.Close()

	var usr User
	c.One(&usr)

	p := bot.GetPortfolio(usr.BinanceKey, usr.BinanceSecret, services)

	utils.JSON(ctx, p)
}

func GetTrades(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	c, err := r.Table("trades").Filter(map[string]interface{}{"user_id": 1}).Run(services.DB)
	if handleErr(ctx, err) {
		return
	}
	defer c.Close()

	var trades []bot.Trade
	c.All(&trades)

	utils.JSON(ctx, trades)
}

func CreateBot(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	var b bot.Config
	utils.FromJSON(ctx.Request.Body(), &b)

	b.UserID = 1

	r.Table("bots").Insert(b).Run(services.DB)
	ctx.SetStatusCode(201)
}

func AdvanceBot(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	c, err := r.Table("bots").Filter(map[string]interface{}{"user_id": 1}).Run(services.DB)
	if handleErr(ctx, err) {
		return
	}
	defer c.Close()

	var b bot.Config
	c.One(&b)

	c, err = r.Table("users").Get(1).Run(services.DB)
	if handleErr(ctx, err) {
		return
	}
	defer c.Close()

	var user User
	c.One(&user)

	resp, _ := bot.Update(&b, user.BinanceKey, user.BinanceSecret, services)

	utils.JSON(ctx, string(resp))
}

func GetBots(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	c, err := r.Table("bots").Filter(map[string]interface{}{"user_id": 1}).Run(services.DB)
	if handleErr(ctx, err) {
		return
	}
	defer c.Close()

	var bots []bot.Config
	c.All(&bots)

	utils.JSON(ctx, bots)
}

func GetUser(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	c, err := r.Table("users").Get(1).Run(services.DB)
	if handleErr(ctx, err) {
		return
	}
	defer c.Close()

	var user User
	c.One(&user)

	utils.JSON(ctx, user)
}

func UpdateUser(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	var u User
	utils.FromJSON(ctx.Request.Body(), &u)

	r.Table("users").Replace(u).Run(services.DB)
	ctx.SetStatusCode(201)
}

func GetIndexNotFound(ctx *fasthttp.RequestCtx, services *services.Services) {
	utils.StaticFile(ctx, services, "/index.html", true)
}

func GetIndex(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	utils.StaticFile(ctx, services, "/login.html", true)
}

func GetLanding(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	utils.StaticFile(ctx, services, "/landing.html", false)
}

func GetStatic(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	utils.StaticFile(ctx, services, "", true)
}

func PurgeStaticCache(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
	services.Cache = make(map[string][]byte)
	ctx.WriteString("OK")
}
