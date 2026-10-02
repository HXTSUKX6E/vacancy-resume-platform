package com.example.demo.service;

import com.example.demo.dto.ResponseNotificationEvent;
import com.example.demo.dto.UserRegistrationEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;
    private final String frontendUrl;

    @Autowired
    public EmailService(JavaMailSender mailSender, ObjectMapper objectMapper,
                        @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.objectMapper = objectMapper;
        this.frontendUrl = frontendUrl;
    }

    @KafkaListener(topics = "user-change-event", groupId = "email-change-group")
    public void changeEmail(String message) {
        try {
            // Десериализация JSON в DTO
            UserRegistrationEvent event = objectMapper.readValue(message, UserRegistrationEvent.class);

            // Логика обработки события (отправка уведомления)
            sendConfirmationChangeEmail(event.getLogin(), event.getToken());

        } catch (Exception e) {
            logger.error("An error occurred", e);
        }
    }


    @KafkaListener(topics = "user-registration", groupId = "registration-group")
    public void listenRegistration(String message) {
        try {
            // Десериализация JSON в DTO
            UserRegistrationEvent event = objectMapper.readValue(message, UserRegistrationEvent.class);

            // Логика обработки события (отправка уведомления)
            sendVerificationEmail(event.getLogin(), event.getToken());

        } catch (Exception e) {
            logger.error("An error occurred", e);
        }
    }

    @KafkaListener(topics = "user-forgot-event", groupId = "user-forgot-event")
    public void listenForgotEmail(String message) {
        try {
            // Десериализация JSON в DTO
            UserRegistrationEvent event = objectMapper.readValue(message, UserRegistrationEvent.class);

            // Логика обработки события (отправка уведомления)
            sendForgotEmail(event.getLogin(), event.getToken());

        } catch (Exception e) {
            logger.error("An error occurred", e);
        }
    }


    @KafkaListener(topics = "response-notifications", groupId = "response-notifications")
    public void listenAddResponse(String message) {
        try {
            // Десериализация JSON в DTO
            ResponseNotificationEvent event = objectMapper.readValue(message, ResponseNotificationEvent.class);

            log.info("Событие пришло");

            // Логика обработки события (отправка уведомления)
            sendMsgAboutResponse(event.getUsername(), event.getResponse(), event.getEmail());

        } catch (Exception e) {
            logger.error("An error occurred", e);
        }
    }


    @Async
    public void sendConfirmationChangeEmail(String to, String token) {
        String subject = "Подтверждение изменения ";
        String confirmationUrl = frontendUrl + "/profile?token=" + token;
        String message = "Перейдите по ссылке для подтверждения смены email: " + confirmationUrl;

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);

        mailSender.send(email);
    }

    @Async
    public void sendVerificationEmail(String to, String token) {
        String subject = "Подтверждение email";
        String confirmationUrl = frontendUrl + "/auth/confirm?token=" + token;

        String textContent = """
    Здравствуйте!
    
    Для подтверждения вашего email перейдите по ссылке:
    %s
    
    Ссылка действительна в течение 24 часов.
    
    Если вы не регистрировались на нашем сервисе, проигнорируйте это письмо.
    """.formatted(confirmationUrl);

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(textContent);

        try {
            mailSender.send(email);
        } catch (MailException e) {
            logger.error("Ошибка при отправке письма с подтверждением email", e);
        }
    }

    @Async
    public void sendForgotEmail(String to, String token) {
        String subject = "Восстановление пароля";
        String resetUrl = frontendUrl + "/auth/reset-password?token=" + token;

        String textContent = """
        Здравствуйте!
        
        Для восстановления пароля перейдите по ссылке:
        %s
        
        Ссылка действительна в течение 24 часов.
        
        Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.
        """.formatted(resetUrl);

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(textContent);

        try {
            mailSender.send(email);
        } catch (MailException e) {
            logger.error("Ошибка при отправке письма для восстановления пароля", e);
        }
    }

    @Async
    public void sendMsgAboutResponse(String username, String responseName, String to) {
        String subject = "Новый отклик на вакансию " + responseName;
        String message = String.format(
                "Уважаемый работодатель,\n" +
                        "На вашу вакансию «%s» откликнулся новый кандидат.\n\n" +
                        "Контактные данные для связи:\n" +
                        "📧 Email: %s\n\n" +
                        "Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.",
                responseName, username
        );

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);

        mailSender.send(email);
    }
}
