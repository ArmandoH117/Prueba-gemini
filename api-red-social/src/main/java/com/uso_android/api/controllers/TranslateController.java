package com.uso_android.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uso_android.api.dtos.groq.TranslateDto.TranslateReq;
import com.uso_android.api.dtos.groq.TranslateDto.TranslateRes;
import com.uso_android.api.services.TranslateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ia")
@RequiredArgsConstructor
public class TranslateController {

    private final TranslateService translateService;

    @PostMapping("/translate")
    public ResponseEntity<TranslateRes> translate(@RequestBody TranslateReq r) {
        String out = translateService.translate(r.text(), r.sourceLang(), r.targetLang());

        return ResponseEntity.ok(new TranslateRes(out));
    }
}
