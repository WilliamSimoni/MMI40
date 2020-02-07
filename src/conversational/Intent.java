package conversational;

import java.util.ArrayList;
import java.util.List;

import general.Element;
import general.IdGenerator;
import general.Props;

public class Intent extends Element {
	
	Props intent;
	Props utterances;

	public Intent(String id) {
		super(id);
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		this.intent=new Props(IdGenerator.getNextIdProps(), type, true, true, 1);
		this.utterances=new Props(IdGenerator.getNextIdProps(), type, true, true, -1);
		
		this.props.put("intent",intent);
		this.props.put("utterances",utterances);
	}

}
