#!/bin/bash
cd /home/gunterelmagno/Repositorios/MapMyJourney/backend
echo "Building and starting backend..."
mvn clean package -DskipTests -q && java -jar target/backend-0.0.1-SNAPSHOT.jar
