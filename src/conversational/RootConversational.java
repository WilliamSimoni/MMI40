package conversational;

import java.util.ArrayList;
import java.util.List;

import general.Element;
import general.IdGenerator;
import general.Props;

public class RootConversational extends Element {
	
	Props botName;// nome del bot
	Props outputVoice;// voce output di Alexa.
	Props sessionTimeout;// tempo di timeout di una sessione.
	Props utterances;//elemento di tipo Utterances. Ha createFile = true.
	Props slots;//elemento di tipo Slots. Ha createFile = true.

	public RootConversational(String id) {
		super(id);
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		List<Class<?>> type2=new ArrayList<Class<?>>();
		type2.add(Utterances.class);
		List<Class<?>> type3=new ArrayList<Class<?>>();
		type3.add(SlotList.class);
		this.botName=new Props(IdGenerator.getNextIdProps(), type, false, false, 1);
		this.outputVoice=new Props(IdGenerator.getNextIdProps(), type, false, false, 1);
		this.sessionTimeout=new Props(IdGenerator.getNextIdProps(), type, false, false, 1);
		this.utterances=new Props(IdGenerator.getNextIdProps(), type2, false, true, -1);
		this.slots=new Props(IdGenerator.getNextIdProps(), type3, false, true, -1);
		this.props.put("botName",botName);
		this.props.put("outputVoice",outputVoice);
		this.props.put("sessionTimeout",sessionTimeout);
		this.props.put("utterances",utterances);
		this.props.put("slots",slots);
		
	}

}
