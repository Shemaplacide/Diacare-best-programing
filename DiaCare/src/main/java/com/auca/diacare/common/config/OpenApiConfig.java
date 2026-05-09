package com.auca.diacare.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI diaCareOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DiaCare API")
                        .description("""
                                **Diabetes Care Management System**

                                A comprehensive REST API for managing diabetes patient care including:
                                - Patient & Doctor profiles
                                - Appointment scheduling
                                - Prescription management
                                - Blood glucose tracking & trend analysis
                                - Health metrics (BMI, HbA1c, Blood Pressure)
                                - Patient health dashboard
                                - Notifications

                                **Authentication**: All protected endpoints require a Bearer JWT token.
                                Use `/api/v1/auth/login` to obtain a token, then click **Authorize** above.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("DiaCare Team")
                                .email("support@diacare.auca.ac.rw"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT token here (without 'Bearer ' prefix)")));
    }
}
