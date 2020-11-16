package services

import (
	"bytes"
	r "gopkg.in/rethinkdb/rethinkdb-go.v6"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
)

type Services struct {
	cacheMutex sync.Mutex
	Client 	*http.Client
	Cache 	map[string][]byte
	DB   	*r.Session
}

func NewServices() *Services {
	log.Print("Creating services..")

	session, err := r.Connect(r.ConnectOpts{
		Address: "localhost",
	})

	if err != nil {
		log.Fatalln(err)
	}

	session.Use("olympus")

	r.SetTags("rethinkdb", "json")

	return &Services{
		Client: &http.Client{},
		Cache: make(map[string][]byte),
		DB:    session,
	}
}

func (s *Services) NewRequest(method string, url string, headers map[string]string, body string) []byte {
	var requestBody bytes.Buffer
	requestBody.Write([]byte(body))

	req, _ := http.NewRequest(method, url, &requestBody)

	for k, v := range headers {
		req.Header.Add(k, v)
	}

	resp, err := s.Client.Do(req)

	if err != nil {
		log.Print(err.Error())
		return nil
	}

	if resp.StatusCode >= 400 {
		log.Print(resp)
		return nil
	}

	defer resp.Body.Close()

	b, _ := ioutil.ReadAll(resp.Body)
	return b
}

func (s *Services) WriteCache(key string, value []byte) {
	s.cacheMutex.Lock()
	s.Cache[key] = value
	s.cacheMutex.Unlock()
}