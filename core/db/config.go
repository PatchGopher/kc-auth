package db

import (
	"fmt"
	"os"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"
)

type DBConfig struct {
	Host     string `validate:"required,hostname_rfc1123|ip" json:"host"`
	Port     string `validate:"required,numeric,min=1,max=65535" json:"port"`
	Username string `validate:"required,min=1,max=63,alphanum" json:"username"`
	Password string `validate:"required,min=8,max=128" json:"password"`
	Database string `validate:"required,min=1,max=63,alphanum" json:"database"`
}

type DBMode string

const (
	ModeReadWrite DBMode = "readwrite"
	ModeReadOnly  DBMode = "readonly"
	ModeCQRS      DBMode = "cqrs"
)

type StoreConfig struct {
	Mode      DBMode
	ReadWrite DBConfig
	ReadOnly  DBConfig
}

var validate *validator.Validate

func GetStoreConfig() StoreConfig {
	if _, err := os.Stat(".env"); err == nil {
		if err := godotenv.Load(); err != nil {
			panic("Error loading .env file")
		}
	}

	validate = validator.New()

	var Mode = DBMode(os.Getenv("DB_MODE"))
	switch Mode {
	case ModeCQRS:
		return StoreConfig{
			Mode:      Mode,
			ReadWrite: GetReadWriteDBConfig(),
			ReadOnly:  GetReadOnlyDBConfig(),
		}
	case ModeReadWrite:
		return StoreConfig{
			Mode:      Mode,
			ReadWrite: GetReadWriteDBConfig(),
		}
	case ModeReadOnly:
		return StoreConfig{
			Mode:     Mode,
			ReadOnly: GetReadOnlyDBConfig(),
		}
	default:
		panic("Invalid DB_MODE environment variable. Must be one of: readwrite, readonly, cqrs")
	}
}


// Example: 
func (c DBConfig) GetConnectionString() string {
	return "host=" + c.Host +
		" port=" + c.Port +
		" user=" + c.Username +
		" password=" + c.Password +
		" dbname=" + c.Database +
		" sslmode=disable"
}


func GetReadWriteDBConfig() DBConfig {
	config := DBConfig{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		Username: os.Getenv("DB_USERNAME"),
		Password: os.Getenv("DB_PASSWORD"),
		Database: os.Getenv("DB_DATABASE"),
	}
	err := validate.Struct(config)
	if err != nil {
		panic("Invalid read-write database configuration: " + err.Error())
	}
	return config
}

func GetReadOnlyDBConfig() DBConfig {
	config := DBConfig{
		Host:     os.Getenv("DB_RO_HOST"),
		Port:     os.Getenv("DB_RO_PORT"),
		Username: os.Getenv("DB_RO_USERNAME"),
		Password: os.Getenv("DB_RO_PASSWORD"),
		Database: os.Getenv("DB_RO_DATABASE"),
	}

	fmt.Println(config)
	err := validate.Struct(config)
	if err != nil {
		panic("Invalid read-only database configuration: " + err.Error())
	}
	return config
}
