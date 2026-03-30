@extends('layouts.app')

@section('title', 'AeroLink Backend')

@section('content')
    <section class="stack">
        <div class="hero-grid">
            <article class="card hero hero-primary">
                <span class="pill">Backend activo</span>
                <h2>AeroLink ya funciona como API para el panel React.</h2>
                <p>
                    Esta portada reemplaza las rutas Blade antiguas del proyecto base. Ahora Laravel se usa
                    principalmente como backend REST para el sistema de simulacion y logistica aerea.
                </p>

                <div class="quick-links">
                    <a class="button primary" href="{{ $frontendUrl }}" target="_blank" rel="noreferrer">Abrir frontend</a>
                    <a class="button secondary" href="{{ $apiUrl }}" target="_blank" rel="noreferrer">Ver resumen API</a>
                    <a class="button accent" href="{{ url('/estado-api') }}" target="_blank" rel="noreferrer">Estado del backend</a>
                </div>
            </article>

            <article class="card hero-side">
                <div>
                    <span class="pill">Cliente recomendado</span>
                    <h3>Frontend React</h3>
                </div>

                <p>
                    Para la demostracion final se recomienda abrir el panel en React y usar Laravel solo como capa API.
                </p>

                <span class="api-code">{{ $frontendUrl }}</span>
            </article>
        </div>

        <article class="card">
            <p class="section-title">Resumen de datos cargados</p>
            <div class="stats">
                @foreach ($stats as $stat)
                    <div class="card">
                        <strong>{{ $stat['label'] }}</strong>
                        <span class="stat-number">{{ $stat['value'] }}</span>
                        <p>{{ $stat['detail'] }}</p>
                    </div>
                @endforeach
            </div>
        </article>

        <article class="card api-card">
            <strong>Punto de entrada principal de la API</strong>
            <span class="api-code">{{ $apiUrl }}</span>
            <p class="hero">
                Si el frontend no estuviera levantado todavia, esta pagina sigue permitiendo verificar que el
                backend esta respondiendo y que las rutas API principales estan disponibles.
            </p>
        </article>
    </section>
@endsection
