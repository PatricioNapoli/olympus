package utils

import "io/ioutil"

func ReadFile(path string) []byte {
	dat, err := ioutil.ReadFile(path)
	Handle(err)

	return dat
}
