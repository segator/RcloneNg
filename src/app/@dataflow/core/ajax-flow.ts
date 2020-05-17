import { CacheFlow } from './cache-flow';
import { DataFlowNode, BareFlowInNode, BareFlowOutNode, CombErr } from './bare-flow';
import { Observable, of } from 'rxjs';
import { ajax, AjaxRequest, AjaxResponse } from 'rxjs/ajax';
import { catchError, map } from 'rxjs/operators';

export type AjaxFlowNode = [AjaxResponse | object, Error[]];

export abstract class AjaxFlow<
	Tin extends BareFlowInNode,
	Tout extends BareFlowOutNode
> extends CacheFlow<Tin, Tout> {
	// protected cacheSupport: boolean;
	// protected cachePath: string;

	protected abstract requestAjax(pre: CombErr<Tin>): AjaxRequest;
	protected abstract reconstructAjaxResult(x: AjaxFlowNode): CombErr<Tout>;
	protected requestCache(pre: CombErr<Tin>): Observable<CombErr<Tout>> {
		return ajax(this.requestAjax(pre)).pipe(
			map((x) => [x, []] as AjaxFlowNode),
			catchError((err): Observable<AjaxFlowNode> => of([{}, [err]])),
			map((x) => this.reconstructAjaxResult(x))
		);
	}
}