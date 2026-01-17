package ro.minibook.dto;

import java.time.Instant;

public record BookingResponse(
        Long id,
        Long roomId,
        String roomName,
        Instant startTime,
        Instant endTime,
        String createdBy
) {}
