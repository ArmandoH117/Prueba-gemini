package com.uso_android.api.services;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import jakarta.mail.MessagingException;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void enviarCorreo(String para, String asunto, String view, Context context) throws MessagingException {
        String html = templateEngine.process(view, context);
        MimeMessage mensaje = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mensaje, true);
        helper.setTo(para);
        helper.setSubject(asunto);
        helper.setText(html, true);
        helper.addInline(
                "logoKusktan",
                new ClassPathResource("static/logo.png")
        );
        mailSender.send(mensaje);
    }


}
