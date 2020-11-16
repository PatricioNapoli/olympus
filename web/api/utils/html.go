package utils

import (
	"bytes"
	"fmt"
	"github.com/PatricioNapoli/olympus/web/api/services"
	"github.com/valyala/fasthttp"
	"mime"
	"strings"
)

func StaticFileWithCache(ctx *fasthttp.RequestCtx, services *services.Services, prefix string) {
	pref := string(ctx.Request.URI().Path())

	if prefix != "" {
		pref = prefix
	}

	path := fmt.Sprintf("./assets/static%s", pref)

	pathSplit := strings.Split(path, "/")
	fileSplit := strings.Split(pathSplit[len(pathSplit) - 1], ".")
	m := mime.TypeByExtension(fmt.Sprintf(".%s", fileSplit[len(fileSplit) - 1]))

	ctx.Response.Header.Set("Content-Type", m)

	if val, exists := services.Cache[path]; exists {
		ctx.Write(val)
		return
	}

	f := ReadFile(path)
	services.WriteCache(path, f)
	ctx.Write(f)
}

func HTMLWithCache(ctx *fasthttp.RequestCtx, cache *map[string][]byte, cachePath string, filePath string, templateVars *map[string]string) {
	ctx.Response.Header.Set("Content-Type", "text/html; charset=utf-8")

	if val, exists := (*cache)[cachePath]; exists {
		ctx.Write(val)
		return
	}

	f := ReadFile(filePath)

	f = HTMLTemplate(templateVars, f)

	(*cache)[cachePath] = f
	ctx.Write(f)
}

func HTMLTemplate(templateVars *map[string]string, template []byte) []byte {
	for k, v := range *templateVars {
		template = bytes.Replace(template, []byte(k), []byte(v), -1)
	}

	return template
}
