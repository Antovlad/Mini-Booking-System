package ro.minibook.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.minibook.domain.Booking;
import ro.minibook.domain.Room;
import ro.minibook.dto.BookingResponse;
import ro.minibook.dto.CreateBookingRequest;
import ro.minibook.repository.BookingRepository;
import ro.minibook.repository.RoomRepository;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final RoomRepository roomRepo;

    public BookingService(BookingRepository bookingRepo, RoomRepository roomRepo) {
        this.bookingRepo = bookingRepo;
        this.roomRepo = roomRepo;
    }

    @Transactional
    public BookingResponse create(CreateBookingRequest req) {
        if (!req.endTime().isAfter(req.startTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        Room room = roomRepo.findByIdForUpdate(req.roomId())
                .orElseThrow(() -> new NoSuchElementException("Room not found"));

        // (Optional) if you want to reduce race conditions:
        // bookingRepo.lockAllForRoom(room.getId());

        boolean overlap = bookingRepo.existsOverlap(room.getId(), req.startTime(), req.endTime());
        if (overlap) {
            throw new IllegalStateException("Time slot already booked");
        }

        Booking b = new Booking();
        b.setRoom(room);
        b.setStartTime(req.startTime());
        b.setEndTime(req.endTime());

        if (req.createdBy() != null && !req.createdBy().isBlank()) {
            b.setCreatedBy(req.createdBy().trim());
        } else {
            b.setCreatedBy("anonymous");
        }

        Booking saved = bookingRepo.save(b);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listByRoom(Long roomId) {
        return bookingRepo.findByRoom_IdOrderByStartTimeAsc(roomId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void cancel(Long id) {
        if (!bookingRepo.existsById(id)) throw new NoSuchElementException("Booking not found");
        bookingRepo.deleteById(id);
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getRoom().getId(),
                b.getRoom().getName(),
                b.getStartTime(),
                b.getEndTime(),
                b.getCreatedBy()
        );
    }
}
