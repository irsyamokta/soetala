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
                'footer.help' => __('footer.help'),
                'footer.privacy' => __('footer.privacy'),
                'footer.terms' => __('footer.terms'),

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
                'checkout.insufficientStock' => __('checkout.insufficientStock'),
                'checkout.failed' => __('checkout.failed'),
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
                'merch.notfound' => __('merch.notfound'),

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

                'privacy.title' => __('privacy.title'),
                'terms.title' => __('terms.title'),

                'privacy.intro' => __('privacy.intro'),
                'privacy.intro.point1' => __('privacy.intro.point1'),
                'privacy.intro.point2' => __('privacy.intro.point2'),
                'privacy.intro.point3' => __('privacy.intro.point3'),

                'privacy.section1.title' => __('privacy.section1.title'),
                'privacy.section1.summary' => __('privacy.section1.summary'),
                'privacy.section1.desc' => __('privacy.section1.desc'),
                'privacy.section1.list1' => __('privacy.section1.list1'),
                'privacy.section1.list2' => __('privacy.section1.list2'),
                'privacy.section1.list3' => __('privacy.section1.list3'),
                'privacy.section1.list4' => __('privacy.section1.list4'),
                'privacy.section1.list5' => __('privacy.section1.list5'),
                'privacy.section1.note' => __('privacy.section1.note'),
                'privacy.section1.payment' => __('privacy.section1.payment'),

                'privacy.section2.title' => __('privacy.section2.title'),
                'privacy.section2.summary' => __('privacy.section2.summary'),
                'privacy.section2.point1' => __('privacy.section2.point1'),
                'privacy.section2.point2' => __('privacy.section2.point2'),

                'privacy.section3.title' => __('privacy.section3.title'),
                'privacy.section3.desc' => __('privacy.section3.desc'),

                'privacy.section4.title' => __('privacy.section4.title'),
                'privacy.section4.desc' => __('privacy.section4.desc'),

                'privacy.section5.title' => __('privacy.section5.title'),
                'privacy.section5.desc' => __('privacy.section5.desc'),

                'privacy.section6.title' => __('privacy.section6.title'),
                'privacy.section6.desc' => __('privacy.section6.desc'),

                'privacy.section7.title' => __('privacy.section7.title'),
                'privacy.section7.summary' => __('privacy.section7.summary'),
                'privacy.section7.point1' => __('privacy.section7.point1'),
                'privacy.section7.point2' => __('privacy.section7.point2'),
                'privacy.section7.note' => __('privacy.section7.note'),

                'privacy.section8.title' => __('privacy.section8.title'),
                'privacy.section8.email' => __('privacy.section8.email'),
                'privacy.section8.contact' => __('privacy.section8.contact'),

                'privacy.section9.title' => __('privacy.section9.title'),
                'privacy.section9.desc' => __('privacy.section9.desc'),

                'terms.intro' => __('terms.intro'),
                
                'terms.section1.title' => __('terms.section1.title'),
                'terms.section1.desc' => __('terms.section1.desc'),

                'terms.section2.title' => __('terms.section2.title'),
                'terms.section2.desc' => __('terms.section2.desc'),

                'terms.section3.title' => __('terms.section3.title'),
                'terms.section3.desc' => __('terms.section3.desc'),
                'terms.section3.prohibited1' => __('terms.section3.prohibited1'),
                'terms.section3.prohibited2' => __('terms.section3.prohibited2'),
                'terms.section3.prohibited3' => __('terms.section3.prohibited3'),

                'terms.section4.title' => __('terms.section4.title'),
                'terms.section4.responsibility1' => __('terms.section4.responsibility1'),
                'terms.section4.responsibility2' => __('terms.section4.responsibility2'),
                'terms.section4.responsibility3' => __('terms.section4.responsibility3'),
                'terms.section4.suspension' => __('terms.section4.suspension'),

                'terms.section5.title' => __('terms.section5.title'),
                'terms.section5.desc' => __('terms.section5.desc'),
                'terms.section5.point1' => __('terms.section5.point1'),
                'terms.section5.point2' => __('terms.section5.point2'),

                'terms.section6.title' => __('terms.section6.title'),
                'terms.section6.desc' => __('terms.section6.desc'),

                'terms.section7.title' => __('terms.section7.title'),
                'terms.section7.desc' => __('terms.section7.desc'),
                'terms.section7.limitation1' => __('terms.section7.limitation1'),
                'terms.section7.limitation2' => __('terms.section7.limitation2'),
                'terms.section7.limitation3' => __('terms.section7.limitation3'),

                'terms.section8.title' => __('terms.section8.title'),
                'terms.section8.desc' => __('terms.section8.desc'),
                'terms.section8.termination1' => __('terms.section8.termination1'),
                'terms.section8.termination2' => __('terms.section8.termination2'),

                'terms.section9.title' => __('terms.section9.title'),
                'terms.section9.desc' => __('terms.section9.desc'),

                'terms.section10.title' => __('terms.section10.title'),
                'terms.section10.email' => __('terms.section10.email'),
                'terms.section10.contact' => __('terms.section10.contact'),
            ],
        ]);
    }
}
