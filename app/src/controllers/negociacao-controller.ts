import { domInjector } from '../decorators/dom-injector.js';
import { Inspect } from '../decorators/inspect.js';
import { logarTempoDeExecucao } from '../decorators/logar-tempo-de-execucao.js';
import { DiasDaSemana } from '../enums/dias-da-semana.js';
import { Negociacao } from '../models/negociacao.js';
import { Negociacoes } from '../models/negociacoes.js';
import { NegociacoesService } from '../services/negociacoes-services.js';
import { imprimir } from '../utils/imprimir.js';
import { MensagemView } from '../views/mensagem-view.js';
import { NegociacoesView } from '../views/negociacoes-view.js';

export class NegociacaoController {

    @domInjector('#data')
    private inputData: HTMLInputElement;
    @domInjector('#quantidade')
    private inputQuantidade: HTMLInputElement;
    @domInjector('#valor')
    private inputValor: HTMLInputElement;

    private negociacoesService = new NegociacoesService()

    private negociacoes = new Negociacoes();
    private negociacoesView = new NegociacoesView('#negociacoesView');
    private mensagemView = new MensagemView('#mensagemView');

    constructor() {
        this.negociacoesView.update(this.negociacoes);
    }

    @Inspect
    @logarTempoDeExecucao()
    public adiciona(): void {

        const negociacao = Negociacao.criaDe(
            this.inputData.value,
            this.inputQuantidade.value,
            this.inputValor.value
        );

        if (!this.diaUtil(negociacao.data)) {
            this.mensagemView
                .update('Apenas negociações em dias úteis são aceitas');
            return;
        }

        this.negociacoes.adiciona(negociacao);
        imprimir(negociacao, this.negociacoes)
        this.limparFormulario();
        this.atualizarView();
    }

    public importarDados(): void {
        this.negociacoesService.
            obterNegociacoesDoDia()
            .then(negociacoesDeHoje => {
                return negociacoesDeHoje.filter(negociacoesDeHoje => {
                    return !this.negociacoes.lista()
                        .some(negociacao => negociacao.igual(negociacoesDeHoje))
                })
            })
            .then(negociacoesDeHoje => {
                for (let negociacao of negociacoesDeHoje) {
                    this.negociacoes.adiciona(negociacao)
                }
                this.negociacoesView.update(this.negociacoes)
            })

    }

    private diaUtil(data: Date) {
        return data.getDay() > DiasDaSemana.DOMINGO
            && data.getDay() < DiasDaSemana.SABADO;
    }

    private limparFormulario(): void {
        this.inputData.value = '';
        this.inputQuantidade.value = '';
        this.inputValor.value = '';
        this.inputData.focus();
    }

    private atualizarView(): void {
        this.negociacoesView.update(this.negociacoes);
        this.mensagemView.update('Negociação adicionada com sucesso');
    }
}
