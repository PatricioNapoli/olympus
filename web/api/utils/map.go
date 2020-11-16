package utils

func MapUnion(left *map[string]interface{}, right *map[string]interface{}) {
	for k, v := range *right {
		(*left)[k] = v
	}
}
