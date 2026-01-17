package ro.minibook.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ro.minibook.dto.CreateRoomRequest;
import ro.minibook.dto.RoomResponse;
import ro.minibook.service.RoomService;
import ro.minibook.dto.TimeSlotResponse;
import java.util.List;
import java.time.Instant;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public RoomResponse create(@Valid @RequestBody CreateRoomRequest req) {
        return roomService.create(req);
    }

    @GetMapping
    public List<RoomResponse> list() {
        return roomService.list();
    }

    @GetMapping("/{id}")
    public RoomResponse get(@PathVariable Long id) {
        return roomService.get(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        roomService.delete(id);
    }

    @GetMapping("/{id}/availability")
    public List<TimeSlotResponse> availability(
            @PathVariable Long id,
            @RequestParam Instant from,
            @RequestParam Instant to
    ) {
        return roomService.availability(id, from, to);
    }
}
