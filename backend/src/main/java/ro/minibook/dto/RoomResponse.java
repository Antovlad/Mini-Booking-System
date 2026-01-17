package ro.minibook.dto;

public record RoomResponse(
        Long id,
        String name,
        Integer capacity
) {}
