
swagger:
	@echo "Generating Swagger documentation..."
	@swag init -g server.go -dir ./core/api --output ./core/api/docs

swagger3:
	@echo "Generating Swagger documentation for v3..."
	@swag2op init --dir ./core --output ./core/api/docs

sdk:
	@echo "Generating SDK..."
	@npx openapi-typescript ./core/api/docs/swagger.yaml -o ./web/src/lib/sdk.d.ts^C