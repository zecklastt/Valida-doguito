export function valida(input) {
    const tipo_input = input.dataset.tipo

    if (validadores[tipo_input]) {
        validadores[tipo_input](input)
    }

    if (input.validity.valid) {
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else {
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostra_mensagem_de_erro(tipo_input, input)
    }
}

const tipos_de_erro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagens_de_erro = {
    nome: {
        valueMissing: 'O campo de nome não pode estar vazio.'
    },
    email: {
        valueMissing: 'O campo de email não pode estar vazio.',
        typeMismatch: 'O email digitado não é válido.'
    },
    senha: {
        valueMissing: 'O campo de senha não pode estar vazio.',
        patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter símbolos.'
    },
    dataNascimento: {
        valueMissing: 'O campo de data de nascimento não pode estar vazio.',
        customError: 'Você deve ser maior que 18 anos para se cadastrar.'
    },
    cpf: {
        valueMissing: 'O campo de CPF não pode estar vazio.',
        customError: 'O CPF digitado não é válido.'
    },
    cep: {
        valueMissing: 'O campo de CEP não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é válido.',
        customError: 'Não foi possível buscar o CEP.'
    },
    logradouro: {
        valueMissing: 'O campo de logradouro não pode estar vazio.'
    },
    cidade: {
        valueMissing: 'O campo de cidade não pode estar vazio.'
    },
    estado: {
        valueMissing: 'O campo de estado não pode estar vazio.'
    },
    preco: {
        valueMissing: 'O campo de preço não pode estar vazio.'

    }
}

const validadores = {
    dataNascimento: input => valida_data_nascimento(input),
    cpf: input => valida_CPF(input),
    cep: input => recuperar_CEP(input)
}

function mostra_mensagem_de_erro(tipo_input, input) {
    let mensagem = ''
    tipos_de_erro.forEach(erro => {
        if (input.validity[erro]) {
            mensagem = mensagens_de_erro[tipo_input][erro]
        }
    })

    return mensagem
}

function valida_data_nascimento(input) {
    const data_recebida = new Date(input.value)
    let mensagem = ''

    if (!maiorQue18(data_recebida)) {
        mensagem = 'Você deve ser maior que 18 anos para se cadastrar.'
    }

    input.setCustomValidity(mensagem)
}

function maiorQue18(data) {
    const data_atual = new Date()
    const data_mais_18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())

    return data_mais_18 <= data_atual
}

function valida_CPF(input) {
    const cpf_formatado = input.value.replace(/\D/g, '')
    let mensagem = ''

    if (!checa_CPF_repetido(cpf_formatado) || !checa_estrutura_CPF(cpf_formatado)) {
        mensagem = 'O CPF digitado não é válido.'
    }

    input.setCustomValidity(mensagem)
}

function checa_CPF_repetido(cpf) {
    const valores_repetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]
    let cpf_valido = true

    valores_repetidos.forEach(valor => {
        if (valor == cpf) {
            cpf_valido = false
        }
    })

    return cpf_valido
}

function checa_estrutura_CPF(cpf) {
    const multiplicador = 10

    return checa_digito_verificador(cpf, multiplicador)
}

function checa_digito_verificador(cpf, multiplicador) {
    if (multiplicador >= 12) {
        return true
    }

    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpf_sem_digitos = cpf.substr(0, multiplicador - 1).split('')
    const digito_verificador = cpf.charAt(multiplicador - 1)
    for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
        soma = soma + cpf_sem_digitos[contador] * multiplicadorInicial
        contador++
    }

    if (digito_verificador == confirma_digito(soma)) {
        return checa_digito_verificador(cpf, multiplicador + 1)
    }

    return false
}

function confirma_digito(soma) {
    return 11 - (soma % 11)
}

function recuperar_CEP(input) {
    const cep = input.value.replace(/\D/g, '')
    const url = `https://viacep.com.br/ws/${cep}/json/`
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if (!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url, options).then(
            response => response.json()
        ).then(
            data => {
                if (data.erro) {
                    input.setCustomValidity('Não foi possível buscar o CEP.')
                    return
                }
                input.setCustomValidity('')
                preenche_campos_com_CEP(data)
                return
            }
        )
    }
}

function preenche_campos_com_CEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
}
