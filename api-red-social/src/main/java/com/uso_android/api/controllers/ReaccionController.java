package com.uso_android.api.controllers;


import com.uso_android.api.dtos.ReaccionRequestDto;
import com.uso_android.api.services.ReaccionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reacciones")
@RequiredArgsConstructor
public class ReaccionController {

    private final ReaccionService reaccionService;

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleReaccion(@RequestBody ReaccionRequestDto reaccionRequest) {
        reaccionService.toggleReaccion(reaccionRequest);
        return ResponseEntity.ok().build();
    }

}
