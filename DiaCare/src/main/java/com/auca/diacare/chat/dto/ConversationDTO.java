package com.auca.diacare.chat.dto;

import jakarta.validation.constraints.NotBlank;

public class ConversationDTO {

    @NotBlank
    private String otherUserEmail;

    public String getOtherUserEmail() { return otherUserEmail; }
    public void setOtherUserEmail(String otherUserEmail) { this.otherUserEmail = otherUserEmail; }
}
