package net.javaguides.springboot.service;

import jakarta.annotation.PostConstruct;
import net.javaguides.springboot.model.Role;
import net.javaguides.springboot.model.User;
import net.javaguides.springboot.repository.RoleRepository;
import net.javaguides.springboot.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Создаёт учётную запись администратора при первом запуске.
 * Роли заполняются миграцией Liquibase, логин и пароль администратора
 * берутся из переменных окружения ADMIN_LOGIN / ADMIN_PASSWORD.
 */
@Service
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private static final long ADMIN_ROLE_ID = 1L;

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final String adminLogin;
    private final String adminPassword;

    @Autowired
    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           BCryptPasswordEncoder bCryptPasswordEncoder,
                           @Value("${admin.login}") String adminLogin,
                           @Value("${admin.password}") String adminPassword) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.adminLogin = adminLogin;
        this.adminPassword = adminPassword;
    }

    @PostConstruct
    public void init() {
        if (userRepository.count() > 0) {
            return;
        }
        if (adminLogin.isBlank() || adminPassword.isBlank()) {
            logger.warn("ADMIN_LOGIN / ADMIN_PASSWORD не заданы, администратор не создан");
            return;
        }
        Role adminRole = roleRepository.findById(ADMIN_ROLE_ID)
                .orElseThrow(() -> new IllegalStateException("Роль администратора не найдена, проверьте миграции"));

        User admin = new User(adminLogin, bCryptPasswordEncoder.encode(adminPassword), adminRole);
        admin.setEnabled(true);
        userRepository.save(admin);
        logger.info("Создан администратор {}", adminLogin);
    }
}
