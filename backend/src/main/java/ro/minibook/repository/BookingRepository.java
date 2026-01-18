package ro.minibook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.minibook.domain.Booking;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        select case when count(b) > 0 then true else false end
        from Booking b
        where b.room.id = :roomId
          and b.startTime < :end
          and :start < b.endTime
    """)
    boolean existsOverlap(@Param("roomId") Long roomId,
                          @Param("start") Instant start,
                          @Param("end") Instant end);

    List<Booking> findByRoom_IdOrderByStartTimeAsc(Long roomId);


    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("select b from Booking b where b.room.id = :roomId")
    List<Booking> lockAllForRoom(@Param("roomId") Long roomId);

    @Query("""
  select b from Booking b
  where b.room.id = :roomId
    and b.startTime < :to
    and :from < b.endTime
  order by b.startTime asc
""")
    List<Booking> findOverlappingInRange(Long roomId, Instant from, Instant to);
}
