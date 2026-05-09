package com.auca.diacare.notification.dto;

import com.auca.diacare.notification.model.Notification.Type;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NotificationDTO {

    @NotNull(message = "Recipient email is required")
    private String recipientEmail;

    @NotNull(message = "Type is required")
    private Type type;

    @NotBlank(message = "Message is required")
    private String message;

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
