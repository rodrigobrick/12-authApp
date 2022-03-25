import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { header } from 'express-validator';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { authResponse, Usuario } from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.baseUrl;
  private _usuario!: Usuario;

  get usuario(){
    return { ...this._usuario};
  }

  constructor( private http: HttpClient ) { }

  registro( name: string, email: string, password: string){
    
    const url = `${this.baseUrl}/auth/new`
    const body = { email, password, name }

    return this.http.post<authResponse>(url, body)
    .pipe(
      tap( resp => {
        if( resp.ok ){
          localStorage.setItem('token',resp.token!)
        }
      }),
      map( resp => resp.ok),
      catchError( error => of(error.error.msg))
    )
  }

  login( email: string, password: string){
    
    const url = `${this.baseUrl}/auth`
    const body = { email, password }

    return this.http.post<authResponse>(url, body)
    .pipe(
      tap( resp => {
        if( resp.ok ){
          localStorage.setItem('token',resp.token!)
        }
      }),
      map( resp => resp.ok),
      catchError( error => of(error.error.msg))
    )
  }

  validarToken(): Observable<boolean> {

    const url  = `${ this,this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders()
          .set('x-token', localStorage.getItem('token') || '' );

    return this.http.get<authResponse>(url, { headers })
      .pipe(
        map( resp => {

          localStorage.setItem('token', resp.token!);
          this._usuario = {
            name: resp.name!,
            uid: resp.uid!,
            email: resp.email!
          }
          return resp.ok;

        }),
        catchError(error => of(false))
      );
  }

  logout(){
    localStorage.removeItem('token')
  }
}
