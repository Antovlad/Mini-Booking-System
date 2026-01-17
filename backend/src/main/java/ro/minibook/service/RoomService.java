package ro.minibook.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.minibook.domain.Room;
import ro.minibook.dto.CreateRoomRequest;
import ro.minibook.dto.RoomResponse;
import ro.minibook.repository.RoomRepository;
import ro.minibook.repository.BookingRepository;
import ro.minibook.dto.TimeSlotResponse;

import java.util.List;
import java.util.NoSuchElementException;
import java.time.Instant;


@Service
public class RoomService {

    private final RoomRepository roomRepo;

    private final BookingRepository bookingRepo;

    public RoomService(RoomRepository roomRepo, BookingRepository bookingRepo) {
        this.roomRepo = roomRepo;
        this.bookingRepo = bookingRepo;
    }

    @Transactional
    public RoomResponse create(CreateRoomRequest req) {
        String name = req.name().trim();

        if (roomRepo.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("Room name already exists");
        }

        Room r = new Room();
        r.setName(name);
        r.setCapacity(req.capacity());

        Room saved = roomRepo.save(r);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> list() {
        return roomRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RoomResponse get(Long id) {
        Room r = roomRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Room not found"));
        return toResponse(r);
    }

    @Transactional
    public void delete(Long id) {
        if (!roomRepo.existsById(id)) throw new NoSuchElementException("Room not found");
        roomRepo.deleteById(id);
    }

    private RoomResponse toResponse(Room r) {
        return new RoomResponse(r.getId(), r.getName(), r.getCapacity());
    }

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> availability(Long roomId, Instant from, Instant to) {
        if (!to.isAfter(from)) throw new IllegalArgumentException("to must be after from");
        roomRepo.findById(roomId).orElseThrow(() -> new NoSuchElementException("Room not found"));

        var bookings = bookingRepo.findOverlappingInRange(roomId, from, to);

        Instant cursor = from;
        List<TimeSlotResponse> free = new java.util.ArrayList<>();

        for (var b : bookings) {
            // dacă avem gap între cursor și start booking
            if (b.getStartTime().isAfter(cursor)) {
                free.add(new TimeSlotResponse(cursor, b.getStartTime()));
            }
            // cursor sare după booking (max, ca să unească overlap-uri)
            if (b.getEndTime().isAfter(cursor)) cursor = b.getEndTime();
        }

        // gap final
        if (to.isAfter(cursor)) free.add(new TimeSlotResponse(cursor, to));

        return free;
    }
}
