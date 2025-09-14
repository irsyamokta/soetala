<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Soetala') }}</title>
    <link rel="icon" type="image/png" href="https://soetala.id/favicon.png" sizes="32x32">

    <!-- SEO -->
    <meta name="description" content="Soetala: Eksibisi karya seni lukisan yang mengangkat perjuangan Jenderal Besar Soedirman. Meresapi semangat juang melalui sentuhan seni dan kisah inspiratif." />
    <meta name="keywords" content="Soetala, Eksibisi Seni, Lukisan Jenderal Soedirman, Seni Perjuangan, Pameran Lukisan Soedirman, Seni Lukis Indonesia" />
    <meta name="author" content="Soetala" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://soetala.id/" />

    <meta property="og:title" content="Soetala - Eksibisi Seni Lukisan Jenderal Besar Soedirman" />
    <meta property="og:description" content="Eksibisi karya seni lukisan tentang perjuangan Jenderal Besar Soedirman. Rasakan kisah heroik melalui keindahan seni." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://soetala.id/" />
    <meta property="og:image" content="https://soetala.id/og-image.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Soetala - Eksibisi Seni Lukisan Jenderal Besar Soedirman" />
    <meta name="twitter:description" content="Eksibisi karya seni lukisan yang menggambarkan perjuangan Jenderal Besar Soedirman. Sebuah pengalaman seni penuh makna." />
    <meta name="twitter:image" content="https://soetala.id/og-image.png" />

    <meta name="google-site-verification" content="IQvWOoE22ma_71Ug_nO1yXNCOhieOQwybNq2Oh9BYXc" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body>
    @inertia
</body>

</html>
