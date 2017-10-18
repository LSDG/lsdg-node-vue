import {Subject} from 'rxjs/Subject';

class AppFacade
{
    constructor()
    {
        this._setupObservables();
    }

    _setupObservables()
    {
        this._resizeEvent = new Subject();
        this.resizeEvent$ = this._resizeEvent.asObservable();
        window.addEventListener('resize', this.initResize.bind(this), { passive: true });
    }

    initResize()
    {
        this._resizeEvent.next();
    }
}

let appFacadeSingleton = new AppFacade();
export default appFacadeSingleton;