package ro.minibook.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ro.minibook.dto.BookingResponse;
import ro.minibook.dto.CreateBookingRequest;
import ro.minibook.service.BookingService;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponse create(@Valid @RequestBody CreateBookingRequest req) {
        return bookingService.create(req);
    }

    @GetMapping
    public List<BookingResponse> list(@RequestParam Long roomId) {
        return bookingService.listByRoom(roomId);
    }

    @DeleteMapping("/{id}")
    public void cancel(@PathVariable Long id) {
        bookingService.cancel(id);
    }
}
