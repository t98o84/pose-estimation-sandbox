setup:
	# If .env exists, do nothing
	# If .env does not exist, copy .env.example to .env
	@if [ ! -f .env ]; then \
		echo "Creating .env file from .env.example"; \
		cp .env.example .env; \
	else \
		echo ".env file already exists, skipping copy"; \
	fi

up: 
	npm i && docker compose up

stop:
	docker compose stop

clean:
	docker compose down --volumes 