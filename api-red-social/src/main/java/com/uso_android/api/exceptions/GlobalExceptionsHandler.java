package com.uso_android.api.exceptions;

import com.uso_android.api.exceptions.exception.DataDuplicationException;
import com.uso_android.api.exceptions.exception.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionsHandler {

    @ExceptionHandler(DataDuplicationException.class)
    public ResponseEntity<Map<String, String>> handleDataDuplicationException(DataDuplicationException ex) {
        Map<String, String> map = new HashMap<>();
        map.put("title", "Error 409");
        map.put("message", "Recurso duplicado: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(map);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFoundException(NotFoundException ex) {
        Map<String, String> map = new HashMap<>();
        map.put("title", "Error 404");
        map.put("message", "Recurso no encontrado: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(map);
    }

}
