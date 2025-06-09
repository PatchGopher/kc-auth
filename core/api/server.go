package api

import (
	"core/db"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	_ "core/api/docs" // Import the generated Swagger docs

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
)

// Server represents the API server
type Server struct {
	router *echo.Echo
	config ServerConfig
	store  *db.Store
}

type CustomContext struct {
	echo.Context
}

func (c *CustomContext) GetSession() (*Session, error) {
	session, ok := c.Get("session").(*Session)
	if !ok || session == nil {
		return nil, fmt.Errorf("no session found")
	}
	return session, nil
}

type Session struct {
	ID        string    `json:"id"`
	UserID    int32     `json:"user_id"`
	ExpiresAt time.Time `json:"expires_at"`
}

// @title Firepoll Core API
// @version 1.0
// @description This is the core API for Firepoll, a polling application.
// @termsOfService http://swagger.io/terms/

// @license.name GPL-3.0
// @license.url http://www.gnu.org/licenses/gpl-3.0.en.html

// @host localhost:8200
// @BasePath /
func NewServer(config ServerConfig, store *db.Store) *Server {
	router := echo.New()

	server := &Server{
		router: router,
		config: config,
		store:  store,
	}

	router.Use(customContext)

	router.Use(server.sessionMiddleware)
	router.Use(middleware.Logger())
	router.Use(middleware.Recover())

	server.routes()

	return server
}

func (s *Server) routes() {
	s.router.GET("/", s.index)
	s.router.GET("/swagger/*", echoSwagger.WrapHandler)

	s.router.GET("/polls", s.listPolls)
	s.router.POST("/polls", s.createPoll)
	s.router.GET("/polls/:id", s.findPoll)
}

func (s *Server) Start() {
	s.router.Logger.Fatal(s.router.Start(s.config.Host + ":" + s.config.Port))
}

func customContext(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := &CustomContext{c}
		return next(cc)
	}
}

func (s *Server) sessionMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie("session")
		if err != nil {
			return next(c)
		}

		sessionToken := []byte(cookie.Value)
		hash := sha256.Sum256(sessionToken)
		sessionID := hex.EncodeToString(hash[:])

		fmt.Println("Session ID:", sessionID)

		session, err := s.store.Queries.FindSession(c.Request().Context(), sessionID)
		if err != nil {
			fmt.Println("Error finding active session:", err)
			return next(c)
		}

		if session.ExpiresAt.Time.Before(time.Now()) {
			fmt.Println("Session expired:", sessionID)
			return next(c)
		}

		c.Set("session", &Session{
			ID:        session.ID,
			UserID:    session.UserID,
			ExpiresAt: session.ExpiresAt.Time,
		})

		return next(c)
	}
}

func (s *Server) index(c echo.Context) error {
	cc := c.(*CustomContext)
	session, err := cc.GetSession()
	if err != nil {
		return c.String(401, "Unauthorized: No active session found")
	}
	return c.String(200, "OK! SessionID: "+session.ID+" UserID: "+fmt.Sprintf("%d", session.UserID))
}
