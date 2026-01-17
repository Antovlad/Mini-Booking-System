package ro.minibook.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateRoomRequest(
        @NotBlank String name,
        @Min(1) Integer capacity
) {}
