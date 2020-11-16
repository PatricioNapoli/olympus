package utils

import "time"

func Millis() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}

func ToMillis(t *time.Time) int64 {
	return t.UnixNano() / int64(time.Millisecond)
}

func DoEvery(d time.Duration, f func()) {
	for range time.Tick(d) {
		f()
	}
}
