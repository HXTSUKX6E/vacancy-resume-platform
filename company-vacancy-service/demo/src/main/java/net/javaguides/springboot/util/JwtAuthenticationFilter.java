package net.javaguides.springboot.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;


import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret.key}")
    private String jwtSecret;

    @Override
    public void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Обработка запросов без токена
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/actuator/health") || requestURI.equals("/api/auth/register") || requestURI.equals("/api/auth/login") || requestURI.equals("/api/auth/confirm") || requestURI.equals("/api/auth/confirm-email-change")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwtToken = authHeader.substring(7);
            try {
                // Создаем секретный ключ из конфигурации
                SecretKey secretKey = new SecretKeySpec(jwtSecret.getBytes(), SignatureAlgorithm.HS256.getJcaName());

                // Парсим JWT токен и извлекаем данные
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey)
                        .build()
                        .parseClaimsJws(jwtToken)
                        .getBody();

                String username = claims.getSubject();
                Long roleId = claims.get("role_id", Long.class); // Здесь можно изменить тип в зависимости от данных в токене

                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleId));

                // Формируем UserDetails
                UserDetails userDetails = User.builder()
                        .username(username)
                        .password("") // Пароль не используется в JWT
                        .authorities(authorities) // Добавляем префикс ROLE_
                        .build();
                // Создаем аутентификацию
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            } catch (JwtException e) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED);
                return; // Прерываем дальнейшее выполнение
            }
        }
        else {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED);
        }
        // Продолжаем обработку запроса, если токен валиден
        filterChain.doFilter(request, response);
    }
    private void sendErrorResponse(HttpServletResponse response, int status) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");

        // Формируем JSON-ответ
        String jsonResponse = "{\"success\": false,\n" +
                "  \"token\": null\n" +
                "}";

        // Отправляем JSON-ответ
        response.getWriter().write(jsonResponse);
    }
}
