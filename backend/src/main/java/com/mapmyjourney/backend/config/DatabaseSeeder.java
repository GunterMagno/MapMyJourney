package com.mapmyjourney.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Executes the SQL statements contained in {@code data.sql} when the database is empty.
 * IMPORTANT: This seeder is DISABLED in 'prod' profile to prevent overwriting user data.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final Environment environment;

    public DatabaseSeeder(JdbcTemplate jdbcTemplate, DataSource dataSource, Environment environment) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.environment = environment;
    }

    @Override
    public void run(String... args) throws Exception {
        // CRÍTICO: No ejecutar seeding en producción
        String[] activeProfiles = environment.getActiveProfiles();
        boolean isProd = java.util.Arrays.asList(activeProfiles).contains("prod");
        
        if (isProd) {
            log.info("Running in PROD profile. Skipping database seeding to preserve user data.");
            return;
        }

        log.info("Checking if database seeding is required...");
        if (!isSeedRequired()) {
            log.info("Skipping data.sql seeding; target user already exists or tables are not empty.");
            return;
        }

        try {
            log.info("Starting database seeding from data.sql...");
            var populator = new ResourceDatabasePopulator(new ClassPathResource("data.sql"));
            populator.setContinueOnError(false);
            populator.execute(dataSource);
            log.info("Successfully seeded database from data.sql");
        } catch (Exception e) {
            log.error("Failed to seed database: {}", e.getMessage(), e);
        }
    }

    private boolean isSeedRequired() {
        // Seed if userTest@example.com doesn't exist
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = 'userTest@example.com'", 
                Integer.class
            );
            boolean missing = count == null || count == 0;
            if (missing) {
                log.info("User 'userTest@example.com' not found. Seeding required.");
            }
            return missing;
        } catch (Exception e) {
            log.warn("Error checking for test user, assuming seed required: {}", e.getMessage());
            return true;
        }
    }

    private boolean isTableEmpty(String tableName) {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);
            return count == null || count == 0;
        } catch (BadSqlGrammarException ex) {
            log.debug("{} table not ready yet, waiting for schema creation.", tableName, ex);
            return true;
        }
    }
}
