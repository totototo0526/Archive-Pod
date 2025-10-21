package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq" // DBドライバ (sqlxが内部で使います)
)

type NewInfographicPayload struct {
	Title         string  `json:"title"`
	Description   *string `json:"description"`
	ThumbnailURL  string  `json:"thumbnail_url"`
	PageURL       string  `json:"page_url"`
	Category      *string `json:"category"`
	CategoryColor *string `json:"category_color"`
}

// --- 仕様書の「infographics」テーブルと
// --- 1対1で対応する「入れ物」をGo言語で定義します！
type Infographic struct {
	ID    int    `db:"id"             json:"id"`
	Title string `db:"title"          json:"title"`
	// DBでNULLになるかも？な所は、* (ポインタ型) にするのがコツであります！
	Description   *string   `db:"description"    json:"description"`
	ThumbnailURL  string    `db:"thumbnail_url"  json:"thumbnail_url"`
	PageURL       string    `db:"page_url"       json:"page_url"`
	Category      *string   `db:"category"       json:"category"`
	CategoryColor *string   `db:"category_color" json:"category_color"`
	CreatedAt     time.Time `db:"created_at"     json:"created_at"`
}

// --- メインの処理であります！ ---
func main() {
	// 1. DBに接続します！
	// (情報は .env からDockerが環境変数として注入してくれてます！)
	dbHost := "db" // docker-compose.ymlのサービス名「db」であります！
	dbUser := os.Getenv("POSTGRES_USER")
	dbPass := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB")

	// 接続文字列 (DSN) を組み立てます
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbUser, dbPass, dbName)

	// sqlxでDBに接続！
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalf("DB接続に失敗しちゃいました…: %v", err)
	}

	log.Println("DB接続、成功であります！")

	// 2. Gin (Webフレームワーク) を起動します！
	router := gin.Default()

	// 3. 交通ルールを定義します！
	// 「/api/infographics」に「GET」リクエストが来たら…
	// 「getInfographicsHandler」関数を動かす！ (DBの接続情報を渡します)
	router.GET("/api/infographics", getInfographicsHandler(db))
	router.POST("/api/infographics", postInfographicsHandler(db))
	router.DELETE("/api/infographics/:id", deleteInfographicHandler(db))
	router.POST("/api/upload", uploadHandler())

	// 4. サーバーをポート 8080 で起動します！
	log.Println("Goサーバーが http://localhost:8080 で起動したであります！")
	router.Run(":8080")
}

// --- 「GET /api/infographics」が来た時に動く関数であります！ ---
func getInfographicsHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. さっき定義した「Infographic」の「入れ物」(の配列) を用意します
		var infographics []Infographic

		// 2. sqlxの魔法！
		// 「infographics」テーブルから全部取ってきて (新しい順に並べて)、
		// ぜんぶ「infographics」変数に詰めて！っていう命令であります！
		err := db.Select(&infographics, "SELECT * FROM infographics ORDER BY created_at DESC")

		// もしDBでエラーが起きたら…
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		// 3. 成功したら、取ってきたデータをJSONにして返します！
		c.JSON(http.StatusOK, infographics)
	}
}
func postInfographicsHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. まずは、さっき定義した「NewInfographicPayload」の
		//    カラっぽの入れ物を用意します
		var payload NewInfographicPayload

		// 2. Ginの魔法！
		//    送られてきたJSONボディを、自動で payload に詰めます！
		if err := c.ShouldBindJSON(&payload); err != nil {
			// もしJSONの形が変だったら、エラーを返します
			c.JSON(http.StatusBadRequest, gin.H{"error": "JSONの形が変であります！"})
			return
		}

		// 3. 受け取ったデータをDBに「INSERT」します！
		//    sqlxで「INSERT」して、DBが自動で作ったIDとかも
		//    ぜんぶ「RETURNING *」で返してもらうのがカッコイイであります！

		var newInfographic Infographic // 返ってきたデータを入れる「Infographic」の入れ物

		query := `
			INSERT INTO infographics (title, description, thumbnail_url, page_url, category, category_color)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING *
		`

		err := db.Get(&newInfographic, query,
			payload.Title, payload.Description, payload.ThumbnailURL,
			payload.PageURL, payload.Category, payload.CategoryColor,
		)

		// もしDBでエラーが起きたら…
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 4. 成功したら、「DBに登録されたデータ」をJSONにして返します！
		c.JSON(http.StatusCreated, newInfographic)
	}
}
func deleteInfographicHandler(db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. まずは、URLの「:id」の部分の数字（ID）を抜き出します！
		id := c.Param("id")

		// 2. DBから、そのIDのデータを「DELETE」します！
		query := "DELETE FROM infographics WHERE id = $1"

		// db.Exec() は、「実行だけして、結果は気にしない」時に使うであります！
		result, err := db.Exec(query, id)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 3. 本当に削除できたか、確認します！
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// もし、削除された行が「0件」だったら…
		if rowsAffected == 0 {
			// それは「そんなIDのデータ、元々なかったよ！」っていう意味であります！
			c.JSON(http.StatusNotFound, gin.H{"error": "そのIDのデータは見つからなかったであります…"})
			return
		}

		// 4. 成功したら、「削除成功したであります！」
		//    (HTTP 204 No Content は「成功したけど、返す中身はないよ」の合図であります！)
		c.Status(http.StatusNoContent)
	}
}
func uploadHandler() gin.HandlerFunc {
	return func(c *gin.Context) {

		// 1. "file"っていう名前で送られてきたファイルを受け取ります！
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ファイルが見つからないであります！"})
			return
		}

		// 2. ファイル名がカブらないように、新しい「ユニークな名前」を作ります！
		//    (例: d4b3b3b0-c0a0-4a0a-b0a0-d4b3b3b0c0a0.png)
		ext := filepath.Ext(file.Filename)       // ".png" とかの拡張子を抜き出します
		newFileName := uuid.New().String() + ext // UUID + 拡張子

		// 3. 保存する「倉庫」の場所を指定します！
		//    (docker-compose.ymlで同期させた、あの場所であります！)
		dst := filepath.Join("/app/uploads", newFileName)

		// 4. Ginの魔法！受け取ったファイルを、その場所に保存します！
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイルの保存に失敗しました…"})
			return
		}

		// 5. 成功したら、「このURLでアクセスできるよ！」っていうJSONを返します！
		//    (Nginxのボスが、/uploads/ を見てくれてるから、このURLになるであります！)
		c.JSON(http.StatusOK, gin.H{
			"url": "/uploads/" + newFileName,
		})
	}
}
