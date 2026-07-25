package es.udc.agon.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

import es.udc.agon.backend.model.entities.UserDao;

@Component
public class DbInitializer {

    private static final Logger log = LoggerFactory.getLogger(DbInitializer.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserDao userDao;

    @EventListener(ApplicationReadyEvent.class)
    public void loadSeedData() {
        // Check if the database already has seed data (look for user000)
        if (userDao.existsByNombre("user000")) {
            log.info("[DbInitializer] Seed data already exists — skipping initialization.");
            return;
        }

        log.info("[DbInitializer] Database is empty — loading seed data from seed-data.sql ...");
        try {
            ScriptUtils.executeSqlScript(
                dataSource.getConnection(),
                new ClassPathResource("seed-data.sql")
            );
            log.info("[DbInitializer] Seed data loaded successfully.");
        } catch (Exception e) {
            log.error("[DbInitializer] Failed to load seed data: {}", e.getMessage(), e);
        }
    }
}
