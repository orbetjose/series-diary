# 📺 Tracker de Series y Películas

> Una aplicación web para registrar y gestionar series, películas y documentales vistos durante el año.

## 🎯 Características

- ✅ Registro de series, películas y documentales
- ✅ Filtrado por categorías y año
- ✅ Estadísticas personales de visualización
- ✅ Interfaz intuitiva y responsive
- ✅ Base de datos en tiempo real con Supabase

## 🛠️ Tecnologías Utilizadas

- **Frontend:** [React/Vue/Next.js - tu stack]
- **Backend/BaaS:** Supabase
- **Estilos:** [Tailwind/CSS/otro]
- **Autenticación:** Supabase Auth

## 📸 Capturas de Pantalla

### Dashboard Principal
![Dashboard](./screenshots/creacion-series-diario.png)
*Vista general con estadísticas del año*

### Agregar Contenido
![Agregar](./screenshots/add-content.png)
*Formulario para registrar nuevo contenido*


## 💡 Motivación del Proyecto

Este proyecto nació de la necesidad de llevar un registro personal de todo el contenido audiovisual que consumo durante el año, permitiéndome analizar mis hábitos de visualización y descubrir patrones interesantes.

## 🚀 Funcionalidades Destacadas

1. **Sistema de Categorización**
   - Separación clara entre series, películas y documentales
   - Tags personalizados
  
2. **Búsqueda y Filtros Avanzados**
   - Por año, mes, rating

## 📊 Arquitectura

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │ ───► │   Supabase   │ ───► │ PostgreSQL  │
│  React/Vue  │      │     API      │      │  Database   │
└─────────────┘      └──────────────┘      └─────────────┘
```

## 🔐 Seguridad

- Autenticación mediante Supabase Auth
- Row Level Security (RLS) implementado
- Validación de datos en cliente y servidor

## 📝 Aprendizajes

Durante el desarrollo de este proyecto aprendí:
- Implementación de RLS en Supabase
- Gestión de estado complejo
- Optimización de queries en tiempo real
- Diseño de UX para aplicaciones CRUD

## 🔮 Próximas Mejoras

- [ ] Integración con API de TMDB para autocompletar
- [ ] Sistema de recomendaciones
- [ ] Exportar datos a CSV/PDF
- [ ] Modo oscuro/claro

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@orbetjose](https://github.com/orbetjose)
- Portafolio: [tu-portfolio.com](https://tu-portfolio.com)
- LinkedIn: [Tu LinkedIn](https://linkedin.com/in/tu-perfil)

---

⭐ Si te gustó este proyecto, considera darle una estrella en GitHub