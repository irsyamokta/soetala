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
                'ticket.title' => __('ticket.title'),
                'ticket.description' => __('ticket.description'),
                'ticket.days' => __('ticket.days'),
                'ticket.hours' => __('ticket.hours'),
                'ticket.minutes' => __('ticket.minutes'),
                'ticket.seconds' => __('ticket.seconds'),

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

                'checkout.ticket' => __('checkout.ticket'),
                'checkout.merch' => __('checkout.merch'),
                'checkout.detail' => __('checkout.detail'),
                'checkout.empty' => __('checkout.empty'),
                'checkout.noTickets' => __('checkout.noTickets'),
                'checkout.note' => __('checkout.note'),
                'checkout.add' => __('checkout.add'),
                'checkout.cart' => __('checkout.cart'),

                'ticket.readmore' => __('ticket.readmore'),
                'ticket.close' => __('ticket.close'),
                'ticket.validation' => __('ticket.validation'),

                'merch.modal.color' => __('merch.modal.color'),
                'merch.modal.size' => __('merch.modal.size'),
                'merch.modal.quantity' => __('merch.modal.quantity'),
                'merch.modal.note' => __('merch.modal.note'),
                'merch.modal.note-placeholder' => __('merch.modal.note-placeholder'),
                'merch.modal.reminder' => __('merch.modal.reminder'),
                'merch.modal.button.add' => __('merch.modal.button.add'),
                'merch.modal.button.disable' => __('merch.modal.button.disable'),

                'transaction.title' => __('transaction.title'),
                'transaction.detail' => __('transaction.detail'),
                'transaction.button.cancel' => __('transaction.button.cancel'),
                'transaction.button.payment' => __('transaction.button.payment'),
                'transaction.button.continue' => __('transaction.button.continue'),
                'transaction.button.loading' => __('transaction.button.loading'),
                'transaction.empty' => __('transaction.empty'),
                'transaction.note' => __('transaction.note'),
                'transaction.error.cancel' => __('transaction.error.cancel'),
                'transaction.confirm.cancel' => __('transaction.confirm.cancel'),
                'transaction.button.yes' => __('transaction.button.yes'),
                'transaction.button.no' => __('transaction.button.no'),
                'transaction.success.cancel' => __('transaction.success.cancel'),
                'transaction.message.cancel_success' => __('transaction.message.cancel_success'),
                'transaction.error.title' => __('transaction.error.title'),
                'transaction.error.message' => __('transaction.error.message'),

                'ticket.history.title' => __('ticket.history.title'),
                'ticket.history.detail' => __('ticket.history.detail'),
                'ticket.history.buyer' => __('ticket.history.buyer'),
                'ticket.history.phone' => __('ticket.history.phone'),
                'ticket.history.show.qr' => __('ticket.history.show.qr'),
                'ticket.history.empty' => __('ticket.history.empty'),
                'ticket.history.category' => __('ticket.history.category'),
                'ticket.history.price' => __('ticket.history.price'),
                'ticket.history.quantity' => __('ticket.history.quantity'),
                'ticket.history.used' => __('ticket.history.used'),
                'ticket.history.not_used' => __('ticket.history.not_used'),
            ],
        ]);
    }
}
