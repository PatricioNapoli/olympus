package utils

import (
	"encoding/json"
	"github.com/valyala/fasthttp"
)

func ToJSON(v interface{}) []byte {
	j, err := json.Marshal(v)
	Handle(err)
	return j
}

func ToPrettyJSON(v interface{}) []byte {
	j, err := json.MarshalIndent(v, "", "    ")
	Handle(err)
	return j
}

func FromJSON(d []byte, v interface{}) interface{} {
	err := json.Unmarshal(d, v)
	Handle(err)
	return v
}

func JSON(ctx *fasthttp.RequestCtx, obj interface{}) {
	ctx.Response.Header.Set("Content-Type", "application/json")
	ctx.Write(ToJSON(obj))
}
