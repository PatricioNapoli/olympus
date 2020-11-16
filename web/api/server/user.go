package server

type User struct {
	ID 				int `json:"id,omitempty"`
	Email           string `json:"email"`
	Hash            string `json:"hash"`
	BinanceKey 		string `json:"binance_key"`
	BinanceSecret 	string `json:"binance_secret"`
}
