package bot

type Config struct {
	ID     			string  `json:"id,omitempty"`
	UserID          int  	`json:"user_id"`
	PortfolioRatio 	float32 `json:"portfolio_ratio"`
	Bias           	float32 `json:"bias"`
	Active		   	bool    `json:"active"`
}
