package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// /api/ にアクセスが来たら、タチコマが挨拶します！
	http.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "わーい！Go API、起動OKであります！")
	})

	log.Println("Goサーバーが http://localhost:8080 で起動したであります！")
	// コンテナの中の8080ポートで待機します
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
