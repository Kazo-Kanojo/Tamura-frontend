import React from 'react';

const RegistrationFormPdf = ({ formData }) => {
  
  const colors = {
    black: '#000000',
    white: '#ffffff',
    gray: '#9ca3af',
    pink: '#831843', 
    yellowBg: '#fefce8', 
  };

  const styles = {
    container: { 
      backgroundColor: colors.white, // Fundo branco geral
      display: 'flex',
      justifyContent: 'center', // Centraliza horizontalmente
      alignItems: 'flex-start', // Alinha ao topo
      padding: '20px', // MARGEM DE SEGURANÇA EXTERNA (Para não colar na borda da tela/PDF)
      width: '100%',
      minHeight: '100vh', // Garante altura total
      boxSizing: 'border-box'
    },
    paper: { 
      backgroundColor: colors.white, 
      color: colors.black, 
      width: '100%',
      maxWidth: '800px', // TRAVA O TAMANHO COMO UMA FOLHA A4 (Evita esticar demais)
      border: 'none',
      boxShadow: 'none',
      padding: '30px', // MARGEM DE SEGURANÇA INTERNA (O texto não cola na borda do papel)
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      boxSizing: 'border-box'
    },
    
    // --- SEUS AJUSTES DE TEXTO (MANTIDOS) ---
    labelStyle: {
      fontWeight: 'bold', 
      whiteSpace: 'nowrap', 
      marginRight: '5px',
      fontSize: '12px',
      marginBottom: '4px', 
    },
    valueTextContainer: {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'flex-end', 
      borderBottom: 'none', 
      
      // MANTENHA SEUS AJUSTES AQUI SE PRECISAR
      minHeight: '25px',       
      paddingBottom: '2px',    
    },
    valueText: {
      fontWeight: 'bold',
      fontSize: '14px', 
      color: colors.black,
      lineHeight: '1.2',
      display: 'block',
      width: '100%',
      whiteSpace: 'pre-wrap', 
      overflowWrap: 'anywhere',
      marginBottom: '0px'
    },
    // -----------------------------------------------------------

    emptyLineContainer: {
      flexGrow: 1,
      borderBottom: `1px solid ${colors.black}`,
      height: '25px', 
      marginLeft: '5px'
    },
    row: {
      display: 'flex',
      alignItems: 'flex-end', 
      marginBottom: '10px', 
      width: '100%'
    },
    sectionBorder: {
      border: `2px solid ${colors.black}`,
      padding: '1rem', // Aumentei um pouco o padding interno do quadro para ficar mais bonito
      marginBottom: '1rem'
    },
    termBox: {
      border: `1px solid ${colors.black}`,
      padding: '1rem', // Mais respiro no texto do termo
      backgroundColor: '#f9fafb',
      fontSize: '10px', 
      textAlign: 'justify',
      marginBottom: '1rem',
      lineHeight: '1.3' // Melhora a leitura do texto pequeno
    },
    boxContainer: {
        borderBottom: `2px solid ${colors.black}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '2px',
        minHeight: '30px'
    }
  };

  const Field = ({ label, value, width = "auto", center = false }) => {
    
    const wrapperStyle = {
      display: 'flex',
      alignItems: 'flex-end', 
      width: width === '100%' ? '100%' : width,
      marginRight: '15px' // Aumentei um pouco o espaço entre campos laterais
    };

    const hasValue = value && String(value).trim() !== '';

    return (
      <div style={wrapperStyle}>
        {label && <span style={styles.labelStyle}>{label}</span>}
        
        {hasValue ? (
          <div style={styles.valueTextContainer}>
             <span style={{
               ...styles.valueText, 
               textAlign: center ? 'center' : 'left',
               paddingLeft: center ? 0 : '5px'
             }}>
               {value}
             </span>
          </div>
        ) : (
          <div style={styles.emptyLineContainer}></div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.paper}>
        
        {/* --- CABEÇALHO --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
           <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>FICHA DE INSCRIÇÃO</h1>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '5px' }}>CHIP Nº</span>
              <div style={{ 
                  ...styles.boxContainer,
                  width: '100px', 
                  backgroundColor: 'transparent', 
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '20px', lineHeight: '1.0', display: 'block' }}>
                    {formData.chipNumber}
                </span>
              </div>
           </div>
        </div>

        {/* --- DADOS PESSOAIS --- */}
        <div style={styles.row}>
          <Field label="Equipe:" value={formData.equipe} width="40%" />
          <Field label="Data de Nascimento:" value={formData.dataNascimento} width="30%" center />
          <Field label="Apelido:" value={formData.apelido} width="30%" />
        </div>

        <div style={styles.row}>
          <Field label="Nome completo:" value={formData.nomeCompleto} width="100%" />
        </div>

        <div style={styles.row}>
          <Field label="RG:" value={formData.rg} width="30%" />
          <Field label="CPF:" value={formData.cpf} width="30%" />
          <Field label="Convênio Médico:" value={formData.convenioMedico} width="40%" />
        </div>

        <div style={styles.row}>
          <Field label="Endereço:" value={formData.endereco} width="100%" />
        </div>

        <div style={styles.row}>
          <Field label="Tel.:" value={formData.tel} width="40%" />
          <Field label="Importante Tel. de acompanhantes em caso de urgência" value={formData.telUrgencia} width="60%" />
        </div>

        {/* --- QUADRO DE CATEGORIAS --- */}
        <div style={{ ...styles.sectionBorder, marginTop: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: colors.pink, fontWeight: 'bold' }}>
            <span>Total de categorias irá participar (</span>
            <div style={{ 
                ...styles.boxContainer,
                width: '40px', 
                margin: '0 5px',
                color: colors.black,
                minHeight: '20px'
            }}>
              <span style={{ lineHeight: '1.0', fontSize: '16px', display: 'block' }}>
                {formData.totalCategorias}
              </span>
            </div>
            <span>)</span>
          </div>

          {formData.inscricoes.map((item, index) => (
            <div key={item.id || index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-end', 
                marginBottom: '10px',
                borderBottom: index === 0 ? '1px dashed #ccc' : 'none',
                paddingBottom: '5px'
            }}>
              
              {/* Checkboxes Estáticos */}
              <div style={{ display: 'flex', gap: '15px' }}>
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const isSelected = item.categorias.includes(num);
                  return (
                    <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{num}ª</span>
                      <div style={{ 
                          width: '30px', 
                          borderBottom: `1px solid ${colors.black}`, 
                          height: '20px', 
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center'
                      }}>
                          {isSelected && <span style={{ fontSize: '16px', lineHeight: '1', fontWeight: 'bold', marginBottom: '10px' }}>X</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Moto e Número */}
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <span style={{ color: colors.pink, fontWeight: 'bold', marginRight: '5px', marginBottom: '10px', fontSize: '12px' }}>MOTO</span>
                    <div style={{ borderBottom: `1px solid ${colors.pink}`, width: '120px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.moto}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <span style={{ color: colors.pink, fontWeight: 'bold', marginRight: '5px', marginBottom: '10px', fontSize: '12px' }}>#</span>
                    <div style={{ borderBottom: `1px solid ${colors.pink}`, width: '50px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.numero}</span>
                    </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* --- TERMO --- */}
        <div style={styles.termBox}>
          <h3 style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', fontSize: '11px', marginTop: 0 }}>Termo de Responsabilidade</h3>
          <p style={{ margin: 0 }}>
            Declaro para os devidos fins, que estou participando deste evento por minha livre e espontânea vontade e estou ciente que o Velocross, trata-se de uma atividade esportiva motorizada e sou conhecedor de todos os riscos envolvidos no motociclismo off Road. Declaro também que me encontro fisicamente, clinicamente apto a participar e não fiz uso de bebida alcoólica ou drogas. Concordo em observar e acatar qualquer decisão oficial dos organizadores do evento relativa a possibilidade de não terminá-lo NO TEMPO HABITUAL, por conta de chuvas, acidentes, etc. Assumo ainda todos os riscos de competir nas CORRIDAS E CAMPEONATOS DE VELOCROSS, isentando os seus organizadores bem como seus patrocinadores, apoiadores, Prefeitura Municipal, de quaisquer acidentes que eu venha a me envolver, durante as competições. Contatos com outros participantes, efeito do clima, incluindo aqui alto calor e suas consequências condições de trafico e do circuito além de outras consequências que possam ter origem em minha falta de condicionamento físico para participar do mencionado evento. De parte das entidades/pessoas aqui nominadas. Estou ciente que qualquer atendimento médico ocasionado na competição será direcionado a rede pública de atendimento médico, "SUS". Concedo ainda aos organizadores do evento e a seus patrocinadores, a utilizarem fotografias, filmagens ou qualquer outra forma que mostre minha participação NAS CORRIDAS E CAMPEONATOS DE VELOCROSS, bem como utilizar imagens para divulgação, prospecção e outras finalidades da organização.
          </p>
        </div>

        {/* --- IMPORTANTE --- */}
        <div style={{ marginBottom: '20px', fontSize: '10px' }}>
          <span style={{ color: colors.pink, textDecoration: 'underline', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>IMPORTANTE:</span>
          <p style={{ margin: 0 }}> Não será devolvido os valores pagos referente as inscrições em HIPÓTESE alguma, bem como não será possível transferi-las para etapas futuras. <span style={{ color: colors.pink, fontWeight: 'bold' }}>É PROIBIDO</span> a transferência de inscrições do piloto para outro piloto. </p> 
          <p style={{ margin: '4px 0 0 0' }}> Caso não seja possível terminar a etapa devido as condições climáticas, condições da pista, quebra de horário, NÃO HAVERÁ compensação ou devolução de valores pagos, as categorias não realizadas terão pontuação dobrada na próxima etapa. </p>
        </div>

        {/* --- RODAPÉ --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', marginBottom: '30px' }}>
          <div style={{ width: '40%', display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ whiteSpace: 'nowrap', marginRight: '5px', marginBottom: '7px', fontSize: '12px', fontWeight: 'bold' }}>São Paulo-SP</span>
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', borderBottom: 'none' }}>
                 <span style={{ fontWeight: 'bold', width: '100%', textAlign: 'center' }}>{formData.localData}</span>
            </div>
          </div>

          <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ borderBottom: `1px solid ${colors.black}`, width: '100%', marginBottom: '7px' }}></div>
            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Assinatura do Piloto ou Responsável</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegistrationFormPdf;