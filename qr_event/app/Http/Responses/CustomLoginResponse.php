<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\Request;

class CustomLoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toResponse($request)
    {
        // Check for stored redirect URL from login form
        $redirectUrl = $request->session()->pull('login_redirect_url');

        if ($redirectUrl && str_starts_with($redirectUrl, '/')) {
            return redirect($redirectUrl);
        }

        return redirect(route('dashboard'));
    }
}
