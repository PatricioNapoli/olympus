package server

import(
	"errors"
	"fmt"
	"github.com/PatricioNapoli/olympus/web/api/services"
	"github.com/valyala/fasthttp"
	"github.com/valyala/fasthttprouter"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime/debug"
	"syscall"
)


type Handler func(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services)
type HandlerPlain func(ctx *fasthttp.RequestCtx, services *services.Services)

func NewCORSMiddleware() Handler {
	return func(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params, services *services.Services) {
		ctx.Response.Header.Add("Access-Control-Allow-Origin", "*")
		ctx.Response.Header.Add("Access-Control-Allow-Headers", "*")
		ctx.Response.Header.Add("Access-Control-Allow-Methods", "*")
		ctx.Response.Header.Add("Access-Control-Allow-Credentials", "true")
	}
}

type Server struct {
	Services *services.Services
	Middlewares []Handler
}

func NewServer() *Server {
	return &Server{
		Services:    services.NewServices(),
		Middlewares: []Handler{NewCORSMiddleware()},
	}
}

func (s *Server) Start() {
	log.Print("Initializing server, routes, handlers and receivers.")

	r := fasthttprouter.New()

	r.GET("/", s.chain(GetIndex))
	r.GET("/static/*filepath", s.chain(GetStatic))
	r.GET("/landing", s.chain(GetLanding))

	r.GET("/api/model/day/stats", s.chain(GetModelDataDay))
	r.GET("/api/model/hour/stats", s.chain(GetModelDataHour))

	r.GET("/api/model/day/pred", s.chain(GetNextDayPred))
	r.GET("/api/model/hour/pred", s.chain(GetNextHourPred))

	r.POST("/api/bot/create", s.chain(CreateBot))
	r.OPTIONS("/api/bot/create", s.chain(Empty))
	r.GET("/api/bot/advance", s.chain(AdvanceBot))
	r.GET("/api/bot/all", s.chain(GetBots))

	r.GET("/api/user/portfolio", s.chain(GetPortfolio))
	r.GET("/api/user/trades", s.chain(GetTrades))
	r.GET("/api/user", s.chain(GetUser))
	r.OPTIONS("/api/user", s.chain(Empty))

	r.POST("/api/user/update", s.chain(UpdateUser))
	r.OPTIONS("/api/user/update", s.chain(Empty))

	r.GET("/api/purge", s.chain(PurgeStaticCache))

	r.NotFound = s.chainPlain(GetIndexNotFound)

	fhServer := &fasthttp.Server{
		Handler: r.Handler,
	}

	go func() {
		log.Print("Starting listening in 8080...")

		if err := fhServer.ListenAndServe(":8080"); err != nil {
			log.Fatal(err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGHUP)
	<-stop

	if err := fhServer.Shutdown(); err != nil {
		log.Fatal(err)
	}
}

func (s *Server) chain(routeHandler Handler) fasthttprouter.Handle {
	return func(ctx *fasthttp.RequestCtx, ps fasthttprouter.Params) {
		var err error
		defer func() {
			r := recover()
			if r != nil {
				switch t := r.(type) {
				case string:
					err = errors.New(t)
				case error:
					err = t
				default:
					err = errors.New("unknown error occurred in panic")
				}

				errStr := fmt.Sprintf("recovered from panic: %s", err.Error())
				log.Print(fmt.Sprintf("request error: %s - %s", errStr, string(debug.Stack())))

				ctx.Error(errStr, http.StatusInternalServerError)
			}
		}()

		for _, h := range s.Middlewares {
			h(ctx, ps, s.Services)
		}

		if ctx.Response.StatusCode() >= 200 && ctx.Response.StatusCode() < 300 {
			routeHandler(ctx, ps, s.Services)
		}
	}
}

func (s *Server) chainPlain(routeHandler HandlerPlain) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		var err error
		defer func() {
			r := recover()
			if r != nil {
				switch t := r.(type) {
				case string:
					err = errors.New(t)
				case error:
					err = t
				default:
					err = errors.New("unknown error occurred in panic")
				}

				errStr := fmt.Sprintf("recovered from panic: %s", err.Error())
				log.Print(errStr)
				debug.PrintStack()

				ctx.Error(errStr, http.StatusInternalServerError)
			}
		}()

		for _, h := range s.Middlewares {
			h(ctx, nil, s.Services)
		}

		if ctx.Response.StatusCode() >= 200 && ctx.Response.StatusCode() < 300 {
			routeHandler(ctx, s.Services)
		}
	}
}
