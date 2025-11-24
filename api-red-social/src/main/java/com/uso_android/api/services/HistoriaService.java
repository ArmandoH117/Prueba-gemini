package com.uso_android.api.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uso_android.api.dtos.HistoriaDto;
import com.uso_android.api.entities.Historia;
import com.uso_android.api.entities.Usuario;
import com.uso_android.api.repositories.HistoriaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HistoriaService {
    private final HistoriaRepository historiaRepository;
    private final GcsService gcsService;
    private final UsuarioService usuarioService;

    public List<HistoriaDto> listadoHistorias(Integer user, Integer page){
        LocalDateTime ultimoDia = LocalDateTime.now().minusDays(1);
        List<HistoriaDto> listado = this.historiaRepository.listadoHistorias(user, ultimoDia, page);

        for (HistoriaDto historia : listado) {
            this.getUrlHistoria(historia);
        }

        return listado;
    }

    public List<String> historiasUsuario(Integer user){
        LocalDateTime ultimoDia = LocalDateTime.now().minusDays(1);
        List<String> historias = this.historiaRepository.historiasByUser(user, ultimoDia);
        
        for (int i = 0; i < historias.size(); i++) {
            String urlTemporal = gcsService.generarUrlTemporal(historias.get(i));
            historias.set(i, urlTemporal);
        }

        return historias;
    }

    private void getUrlHistoria(HistoriaDto historiaDto){
        historiaDto.setHistoriaUrl(gcsService.generarUrlTemporal(historiaDto.getHistoriaUrl()));
    }

    @Transactional
    public boolean guardarHistoria(HistoriaDto historiaDto){
        try{
            Usuario usuario = this.usuarioService.getUsuarioReference(historiaDto.getIdUsuario());
            Historia historia = new Historia();
            historia.setHistoriaContenido(historiaDto.getHistoriaContenido());
            historia.setUsuario(usuario);
            
            historia.setHistoriaUrl(
                gcsService.upload(historiaDto.getArchivoHistoria(), "usuario/" + historiaDto.getIdUsuario() + "/historias")
            );

            historia = this.historiaRepository.save(historia);
            historiaDto.setHistoriaUrl(this.gcsService.generarUrlTemporal(historia.getHistoriaUrl()));

            historiaDto.setArchivoHistoria(null);
            usuario.setHistoria(historia);
            usuarioService.actualizarHistoria(usuario);
            return true;
        }catch(Exception ex){
            return false;
        }
    }
}
