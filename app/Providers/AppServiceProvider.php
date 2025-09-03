<?php

namespace App\Providers;

use Inertia\Inertia;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Inertia::share([
            'locale' => fn() => App::getLocale(),
            'translations' => fn() => [
                'login' => __('login'),
                'forgot-password' => __('forgot-password'),
                'dont-have-account' => __('dont-have-account'),
                'have-account' => __('have-account'),
                'register' => __('register'),
                'home' => __('home'),
                'profile' => __('profile'),
                'tickets' => __('tickets'),
                'transactions' => __('transactions'),
                'logout' => __('logout'),
                'buy_ticket' => __('buy_ticket'),
                'ots_price' => __('ots_price'),

                'cancel' => __('cancel'),
                'save' => __('save'),
                'delete' => __('delete'),

                'male' => __('male'),
                'female' => __('female'),

                'name-label' => __('name-label'),
                'phone-label' => __('phone-label'),
                'gender-label' => __('gender-label'),
                'password-label' => __('password-label'),
                'newpassword-label' => __('newpassword-label'),
                'confirmpassword-label' => __('confirmpassword-label'),

                'name-placeholder' => __('name-placeholder'),
                'phone-placeholder' => __('phone-placeholder'),
                'gender-placeholder' => __('gender-placeholder'),
                'email-placeholder' => __('email-placeholder'),
                'password-placeholder' => __('password-placeholder'),
                'newpassword-placeholder' => __('newpassword-placeholder'),
                'confirmpassword-placeholder' => __('confirmpassword-placeholder'),

                'quote-1' => __('quote-1'),
                'quote-2' => __('quote-2'),

                'about' => __('about'),
                'exhi' => __('exhi'),
                'bition' => __('bition'),
                'about-1' => __('about-1'),
                'about-2' => __('about-2'),

                'gallery.heading' => __('gallery.heading'),
                'gallery.subheading' => __('gallery.subheading'),
                'gallery.email-1' => __('gallery.email-1'),
                'gallery.email-2' => __('gallery.email-2'),

                'ticket.heading' => __('ticket.heading'),
                'ticket.subheading' => __('ticket.subheading'),

                'merch.heading' => __('merch.heading'),
                'merch.subheading' => __('merch.subheading'),
                'merch.button' => __('merch.button'),

                'merch.color' => __('merch.color'),
                'merch.size' => __('merch.size'),
                'merch.quantity' => __('merch.quantity'),
                'merch.note' => __('merch.note'),
                'merch.note-placeholder' => __('merch.note-placeholder'),
                'merch.stock' => __('merch.stock'),
                'merch.reminder' => __('merch.reminder'),

                'footer.initiator' => __('footer.initiator'),
                'footer.contact' => __('footer.contact'),
                'footer.location' => __('footer.location'),
                'footer.copyright' => __('footer.copyright'),

                'emailverify.description' => __('emailverify.description'),
                'emailverify.button' => __('emailverify.button'),
                'emailverify.status' => __('emailverify.status'),

                'resetpassword.description' => __('resetpassword.description'),
                'resetpassword.button' => __('resetpassword.button'),

                'forgotpassword.description' => __('forgotpassword.description'),
                'forgotpassword.button' => __('forgotpassword.button'),

                'profile.edit' => __('profile.edit'),
                'profile.title' => __('profile.title'),
                'profile.information' => __('profile.information'),
                'profile.photo' => __('profile.photo'),
                'profile.name' => __('profile.name'),
                'profile.email' => __('profile.email'),
                'profile.phone' => __('profile.phone'),
                'profile.changepassword' => __('profile.changepassword'),
                'changepassword.description' => __('changepassword.description'),
                'changepassword.button' => __('changepassword.button'),

                'oldpassword.label' => __('oldpassword.label'),
                'newpassword.label' => __('newpassword.label'),
                'confirmpassword.label' => __('confirmpassword.label'),

                'oldpassword.placeholder' => __('oldpassword.placeholder'),
                'newpassword.placeholder' => __('newpassword.placeholder'),
                'confirmpassword.placeholder' => __('confirmpassword.placeholder'),

                'profile.deleteaccount' => __('profile.deleteaccount'),
                'deleteaccount.description' => __('deleteaccount.description'),
                'deleteaccount.button' => __('deleteaccount.button'),
                'deleteaccount.warning' => __('deleteaccount.warning'),
            ],
        ]);
    }
}
