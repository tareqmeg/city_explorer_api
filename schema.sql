DROP TABLE IF EXISTS location_Data;

CREATE TABLE IF NOT EXISTS location_Data ( 
    search_query VARCHAR(255) NOT NULL,
    formatted_query VARCHAR(255),
    latitude NUMERIC,
    longitude NUMERIC,
    PRIMARY KEY (search_query)
);

