package utils

import (
	"crypto/rand"
	"unsafe"
)

var alphabet = []byte("abcdefghijklmnopqrstuvwxyz0123456789")

func RandomAlpha(size int) string {
	b := make([]byte, size)
	rand.Read(b)
	for i := 0; i < size; i++ {
		b[i] = alphabet[b[i] / 5]
	}
	return *(*string)(unsafe.Pointer(&b))
}

